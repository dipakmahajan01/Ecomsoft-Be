import axios, { AxiosResponse } from 'axios';

interface UploadResponseData {
  files: { id: string }[];
}

interface ExcelResponseData {
  // Define the structure of the Excel response as per your API documentation
  outputUrl: string;
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

export async function convertPdfToExcel(pdfFile: Buffer, apiKey: string): Promise<ExcelResponseData> {
  const uploadedId = await uploadFile(pdfFile, apiKey);
  return convertToExcel(uploadedId, apiKey);
}
