/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import UserCredential from '../model/user_credential.model';
import { FLIPKART } from '../common/global-constants';

export const generateToken = async (sellerAuth) => {
  try {
    const flipkartAccount = await UserCredential.findOne({ is_deleted: false });
    // console.log('flipkartAccount :>> ', flipkartAccount);
    let base64Credentials;
    if (sellerAuth) {
      base64Credentials = btoa(`${sellerAuth.api_key}:${sellerAuth.secret}`);
    } else {
      base64Credentials = btoa(`${flipkartAccount.api_key}:${flipkartAccount.secret}`);
    }

    // console.log('base64Credentials :>> ', base64Credentials);
    const config = {
      method: 'get', // Change the HTTP method as needed (e.g., 'post', 'put', 'delete', etc.)
      url: FLIPKART.GENERATE_TOKEN_API,
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json', // Adjust the content type if necessary
      },
    };
    const { data } = await axios(config);
    console.log('data :>> ', data);
    if (!data && !data.data.access_token) {
      return [];
    }
    return { access_token: data.access_token };
  } catch (error) {
    return error;
  }
};

// export const OrderApi = async () => {
//   try {
//     const { access_token: accessToken }: any = await generateToken();
//     const config = {
//       method: 'POST',
//       url: FLIPKART.ORDER_API,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json', // Adjust the content type if necessary
//       },
//       data: {
//         filter: {
//           type: 'postDispatch',
//           states: ['DELIVERED'],
//         },
//       },
//     };
//     const {data} = await axios(config);
//     console.log('data :>> ', data);
//     const b = data.nextPageUrl.replace(/'/g, '')

//     if(data.hasMore){
//       const config = {
//         method: 'POST',
//         url: `https://api.flipkart.net/sellers${b}`,
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json', // Adjust the content type if necessary
//         },
//         data: {
//           filter: {
//             type: 'postDispatch',
//             states: ['DELIVERED'],
//           },
//         },
//       };
//       console.log('config.url :>> ', config.url);
//      const  data1 = await axios(config)
//      console.log('data1 :>> ', data1);
//     }
//     if (!data) {
//       return [];
//     }
//     return { order_data:[data.ship] };
//   } catch (error) {
//     return error;
//   }
// };
export async function fetchShipments(config: any) {
  try {
    const newArr: any = [];
    const { access_token: accessToken }: any = await generateToken(null);
    const header = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Adjust the content type if necessary
    };
    // eslint-disable-next-line no-param-reassign
    config.headers = header;
    const { data } = await axios(config);
    // If there are more shipments, make a recursive call
    const nextUrl = data.nextPageUrl.replace(/'/g, '');
    if (data.hasMore) {
      newArr.push(...data.shipments);

      const config = {
        method: 'POST',
        url: `https://api.flipkart.net/sellers${nextUrl}`,
        data: {
          filter: {
            type: 'postDispatch',
            states: ['DELIVERED'],
          },
        },
      };
      await fetchShipments(config);
    } else {
      return { data: newArr };
    }
    return [];
  } catch (error) {
    throw new Error('axios shipment error');
  }
}

export const getCancelOrders = async (sellerAuth, axiosConfig: AxiosRequestConfig, orderList: any) => {
  try {
    if (!axiosConfig.headers?.Authorization) {
      const { access_token: accessToken } = (await generateToken(sellerAuth)) as any;
      axiosConfig.headers.Authorization = `Bearer ${accessToken}`;
      console.log('got token ........', axiosConfig.headers.Authorization, axiosConfig, accessToken, sellerAuth);
    }
    const { data } = await axios(axiosConfig);
    const { hasMore, nextPageUrl, shipments } = data;
    console.log('shipmentdata.....', shipments.length);
    orderList.push(shipments);
    if (hasMore) {
      const newAxiosConfig = {
        ...axiosConfig,
        method: 'GET',
        url: `${FLIPKART.FLIPKART_BASE_URL}/sellers${nextPageUrl}`,
        data: null,
      };
      await getCancelOrders(sellerAuth, newAxiosConfig, orderList);
      return orderList;
    }
    return orderList;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorCode = error.response.data?.error;
      if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
        delete axiosConfig.headers.Authorization;
        await getCancelOrders(sellerAuth, axiosConfig, orderList);
        return orderList;
      }
      throw error;
    }
    console.log('Need to handle the error here........', error);
    throw error;
  }
};
