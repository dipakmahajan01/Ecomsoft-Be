/* eslint-disable no-console */
import axios from 'axios';
import UserCredential from '../model/user_credential.model';
import { FLIPKART } from '../common/global-constants';

export const generateToken = async () => {
  try {
    const flipkartAccount = await UserCredential.findOne({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f',
    });
    // console.log('flipkartAccount :>> ', flipkartAccount);
    const base64Credentials = btoa(`${flipkartAccount.api_key}:${flipkartAccount.secret}`);
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
let newArr: any = [];
export async function fetchShipments(config: any) {
  try {
    const { access_token: accessToken }: any = await generateToken();
    const header = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Adjust the content type if necessary
    };
    // eslint-disable-next-line no-param-reassign
    config.headers = header;
    const { data } = await axios(config);
    console.log('data :>> ', data);
    const nextUrl = data.nextPageUrl.replace(/'/g, '');
    console.log('nextUrl :>> ', nextUrl);
    // if (data.nextUrl) {
    //   newArr.push(...data.shipments);

    //   const config = {
    //     method: 'POST',
    //     url: `https://api.flipkart.net/sellers${nextUrl}`,
    //     data: {
    //       filter: {
    //         type: 'postDispatch',
    //         states: ['DELIVERED'],
    //         orderDate: {
    //           from: '2023-09-14',
    //           to: '2023-12-14',
    //         },
    //       },
    //     },
    //   };
    //   await fetchShipments(config);
    // }
    // console.log('newArr :>> ', newArr);
    return newArr;
  } catch (error) {
    throw new Error('axios shipment error');
  }
}
