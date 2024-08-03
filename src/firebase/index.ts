import * as admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: 'aumsoft-b52bd',
  private_key_id: 'b1a8e3c29f4a607c7a4ae583b4f3052e52ed1f5a',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDmR0yj5WeAPt4i\n6TEhx6rUcar8GdESbHAhvyZF8UAUuzk6g4VwzkC8DaxRAKkY+qkerCK+Z3EJle62\n67x8rQeyCmw+QFHo3D8IcQWOXgj0nEoRpiopXB7LfSkljtzSrpaERX2hybW3149W\nrM4kCHRAUnTJhaaQpdmcL73lXtgZeA8GD0OM1HVvOpkdkyzEGmoQcuyeQ8Qs9iDu\nsDPUzXG/hRnxffmaCpAuDUaILNHZdDAMPDTmiJluGSkbpXuFAYznZCw038fe/nQ3\nTZwyUmTkbZKM28+Nosh0bSoi7bxn0DmhYyYhzCdW2Iyunh0JHlgclCMTPHzJVPDb\nAyo1dGIvAgMBAAECggEARDBfxvai5+x13fOci2qzMNZ58c35RZHbwHp4bGSse5cX\nMrcIeCdzLtyDprbh29Y55y3E2goKhHKj7gGvXmHkcfm5JNPqDWDOv4KsSQSadUik\nfEZunLG9IreszATaaf6t7nwfYB25VDeeJ+Xi4vOn7PYdxCDx+kpKPoA6pKWpqxx8\nxfalGMEC9ueYhwKwnQ0n+5cQ4aTDcEFnZFyLJovGHYImGwLuLs4F75y5ymwpKUNl\ndxlqbcseyJQOz/nRf0rNDEnl9xBl2aauddLFaLluKHZa9QA2aVpPs7DfUGa1AL4z\nQ+Sn0fhLKQMdOIh9lNQr1Zz181p3jIB0BlRCwil7RQKBgQD6RSC9zzTUbNygYx1e\nE4hHTaEEiMx5PA8K+fXuZtsi+cwiBsjKz0Crg5DufNm4zTxMsS7oZ/1rNWO7yeQH\nB8oXudiVJn4AMREK9XwqO8NrOD3mjr1Ryck9YI+UJ6kW4WgjwSAMfbj8ddbMtD9g\nxkT6h0/A5P3MP1pwCdstBTNQdQKBgQDrjP9/wM0flsbZ5gWomKGiosA5S1aGKfAi\nFq7reBrc2pMiQmCwXmRIaU+qbfUvz4KuPzaD4DnLexjHqR1H92zJSsPa2PpoAfnx\nCxVv/bXb0K4h/6xn9x2NFSn4jsL0vznh3GKGp0kV+skx7+L8HePPoEWBAvOcmbqm\nS/wUgWKTkwKBgHxS0sz3ndrYqVDTa8dMFKq3GYHTIyAmgaKGQXFIjxt0078jd6Oo\nCQwqs1iFlPKEoavHaPHylqUnRIAI7sm/SNk4bSrKkFUwCrNS93dTcORWcAmUZt+2\nSc2/phOHECxZlQ4N5gnOepKPR0ExWTqNw75gcXH1T06jOh3mB4b5yl/xAoGAOE5i\nHPXHks+GBTxZCe5CZRAmhwudSUDpKBzn/12cfkK5fS0E0+QccLrL0l+qhp1CDckK\njQeiiSOJzuB8IWHh3VRD8SKA6S/fwWD25Ohu+natyW7Glauaosj2WXY24C599aGq\n46lFbT2frpI7Xiz+8fjL5IUCGuMcnPf48CXlnIUCgYEAz7Y4DQ9FL/AwDk7Q8iyU\n0McxxLpBgqak8JuHZqZ4vvVlDmikBdUo48RhWvmeQ4chQOmcsJloALDXMhkJSgnR\nEg9VXyhiStIj2yQg8/PCzoDOnHq4JsPjVNwkIhNEaj4G7Jjwr2nEkX89IgvpgsS6\nbQ5B6ovD4bY+jsO/Emwq0qI=\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-exnfi@aumsoft-b52bd.iam.gserviceaccount.com',
  client_id: '110459534714571265730',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-exnfi%40aumsoft-b52bd.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

let bucket: any = null;
export const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'gs://aumsoft-b52bd.appspot.com',
  });
  // eslint-disable-next-line no-console
  console.info(`⚡️ ######################## Firebase connected 👍🏼 ##############`);
  bucket = admin.storage().bucket();
};

type UploadLocation = 'Payment' | 'Returns' | 'orders';

type StoreFile = (params: {
  file: Buffer;
  fileName: string;
  contentType: string;
  location: UploadLocation;
}) => Promise<string>;

export const storeFile: StoreFile = async ({ file, fileName, contentType, location }): Promise<string> => {
  try {
    const fileUpload = bucket.file(`${location}/${fileName}`);

    await fileUpload.save(file, {
      metadata: {
        contentType,
      },
    });

    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    return url;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while storing file in firebase....', error);
    throw new Error('File upload failed');
  }
};
