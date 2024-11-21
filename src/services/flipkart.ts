// /* eslint-disable consistent-return */
// /* eslint-disable no-param-reassign */
// /* eslint-disable no-console */
// import axios from 'axios';
// import UserCredential from '../model/user_credential.model';
// import { FLIPKART } from '../common/global-constants';
// import order from '../model/order.model';
// import { logInfo, logsError } from '../lib';

// export const generateToken = async () => {
//   try {
//     const flipkartAccount = await UserCredential.findOne({
//       user_id: '0b0a540e-5779-4352-bdca-6d64fec4f6b7',
//     });
//     let base64Credentials = btoa(`${flipkartAccount.api_key}:${flipkartAccount.secret}`);

//     const config = {
//       method: 'get', // Change the HTTP method as needed (e.g., 'post', 'put', 'delete', etc.)
//       url: FLIPKART.GENERATE_TOKEN_API,
//       headers: {
//         Authorization: `Basic ${base64Credentials}`,
//         'Content-Type': 'application/json', // Adjust the content type if necessary
//       },
//     };
//     const { data } = await axios(config);
//     if (!data && !data.data.access_token) {
//       return [];
//     }
//     return { access_token: data.access_token };
//   } catch (error) {
//     return error;
//   }
// };

// // export const OrderApi = async () => {
// //   try {
// //     const { access_token: accessToken }: any = await generateToken();
// //     const config = {
// //       method: 'POST',
// //       url: FLIPKART.ORDER_API,
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //         'Content-Type': 'application/json', // Adjust the content type if necessary
// //       },
// //       data: {
// //         filter: {
// //           type: 'postDispatch',
// //           states: ['DELIVERED'],
// //         },
// //       },
// //     };
// //     const {data} = await axios(config);
// //     const b = data.nextPageUrl.replace(/'/g, '')

// //     if(data.hasMore){
// //       const config = {
// //         method: 'POST',
// //         url: `https://api.flipkart.net/sellers${b}`,
// //         headers: {
// //           Authorization: `Bearer ${accessToken}`,
// //           'Content-Type': 'application/json', // Adjust the content type if necessary
// //         },
// //         data: {
// //           filter: {
// //             type: 'postDispatch',
// //             states: ['DELIVERED'],
// //           },
// //         },
// //       };
// //      const  data1 = await axios(config)
// //     }
// //     if (!data) {
// //       return [];
// //     }
// //     return { order_data:[data.ship] };
// //   } catch (error) {
// //     return error;
// //   }
// // };
// export async function fetchShipments(config: any) {
//   const newArr: any = [];
//   try {
//     const { access_token: accessToken }: any = await generateToken();
//     const header = {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/json', // Adjust the content type if necessary
//     };
//     // eslint-disable-next-line no-param-reassign
//     config.headers = header;
//     const { data } = await axios(config);
//     const nextUrl = data.nextPageUrl.replace(/'/g, '');
//     if (data.hasMore) {
//       newArr.push(...data.shipments);
//       const config = {
//         method: 'GET',
//         url: `https://api.flipkart.net/sellers${nextUrl}`,
//       };
//       const shipments = await fetchShipments(config);
//       newArr.push(...shipments.data);
//     }
//     return { data: newArr, accessToken };
//   } catch (error) {
//     throw new Error('axios shipment error');
//   }
// }

// export const orderStatusCheckApi = async () => {
//   try {
//     const { access_token: accessToken }: any = await generateToken();
//     let orderData = await order.find({}).limit(25);
//     orderData.map((data) => data.order_item_id);
//     orderData.toString();
//     const config = {
//       method: 'get', // Change the HTTP method as needed (e.g., 'post', 'put', 'delete', etc.)
//       url: `${FLIPKART.ORDER_STATUS_API}?returnIds=${orderData}`,
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json', // Adjust the content type if necessary
//       },
//     };
//     const { data } = await axios(config);
//     logInfo('data', data);
//   } catch (error: any) {
//     logsError(error, error?.response?.data);
//     return error;
//   }
// };
