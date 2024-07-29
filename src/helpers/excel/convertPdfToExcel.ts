import axios, { AxiosResponse } from 'axios';
import { logInfo } from '../../lib';

interface UploadResponseData {
  files: { id: string }[];
}

interface ExcelResponseData {
  // Define the structure of the Excel response as per your API documentation
  isSuccess: boolean;
  message: string;
  data: {
    outputUrl: string;
  };
}

async function uploadFile(fileBuffer: Buffer, apiKey: string): Promise<string> {
  const uploadConfig = {
    method: 'post' as const,
    maxBodyLength: Infinity,
    url: 'https://api.pdfrest.com/upload',
    headers: {
      'Api-Key': apiKey,
      'Content-Filename': 'filename.pdf',
      'Content-Type': 'application/octet-stream',
    },
    data: fileBuffer,
  };

  const uploadResponse: AxiosResponse<UploadResponseData> = await axios(uploadConfig);
  return uploadResponse.data.files[0].id;
}

async function convertToExcel(uploadedId: string, apiKey: string): Promise<ExcelResponseData> {
  const excelConfig = {
    method: 'post' as const,
    maxBodyLength: Infinity,
    url: 'https://api.pdfrest.com/excel',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    data: { id: uploadedId },
  };

  const excelResponse: AxiosResponse<ExcelResponseData> = await axios(excelConfig);
  return excelResponse.data;
}

export async function getExcelFileByUrl(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'base64');
}

const waitFor = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const RETRY_COUNT = 2;
const WAIT_TIME_MS = 400;
export async function convertPdfToExcel(pdfFile: Buffer, apiKey: string): Promise<ExcelResponseData> {
  let uploadedId = null;

  for (let i = 0; i < RETRY_COUNT; i += 1) {
    try {
      uploadedId = await uploadFile(pdfFile, apiKey);
      break;
    } catch (error) {
      logInfo('Retrying...');
      await waitFor(WAIT_TIME_MS);
    }
  }

  for (let i = 0; i < RETRY_COUNT; i += 1) {
    try {
      const excelResponse = await convertToExcel(uploadedId, apiKey);
      return {
        isSuccess: true,
        message: 'Successfully converted PDF to Excel',
        data: excelResponse,
      };
    } catch (error) {
      logInfo('Retrying...');
      await waitFor(WAIT_TIME_MS);
    }
  }

  return {
    isSuccess: false,
    message: 'Failed to convert PDF to Excel. Please try again later',
    data: null,
  };
}
