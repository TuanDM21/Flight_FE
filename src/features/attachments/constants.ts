// Upload progress constants
export const UPLOAD_PROGRESS = {
  INITIAL: 0,
  URL_GENERATED: 10,
  URLS_READY: 20,
  FILE_UPLOADED: 80,
  COMPLETED: 100,
} as const

// Error messages
export const ERROR_MESSAGES = {
  NO_FILES: 'No files provided',
  NO_UPLOAD_URL: (fileName: string) =>
    `Không tìm thấy URL tải lên cho ${fileName}`,
  UPLOAD_FAILED: (fileName: string, status: number, statusText: string) =>
    `Không thể tải lên ${fileName}: ${status} ${statusText}`,
  NO_INTERNET:
    'Không có kết nối internet khi tải lên. Vui lòng kiểm tra kết nối mạng.',
  SERVER_ERROR: 'Lỗi server khi tải lên. Vui lòng thử lại sau.',
  UPLOAD_ABORTED: 'Upload đã bị hủy.',
  ALL_FAILED: 'Tất cả các file đều tải lên thất bại',
  PARTIAL_FAILED: (count: number) => `${count} file(s) failed to upload`,
  OFFLINE: 'Không có kết nối internet. Vui lòng kiểm tra kết nối mạng.',
  FETCH_FAILED: 'Lỗi server. Vui lòng thử lại sau.',
} as const

// HTTP headers for Azure Blob Storage
export const UPLOAD_HEADERS = {
  BLOB_TYPE: 'x-ms-blob-type',
  CONTENT_TYPE: 'Content-Type',
} as const

export const AZURE_BLOB_TYPE = 'BlockBlob'
