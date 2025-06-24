import { GET } from "../https";

interface AppDownloadResponse {
  download_url: string;
  version: string;
  file_size: string;
  release_notes: string;
  last_updated: string;
}

export const getMacOSAppDownload = () =>
  GET({
    url: "/api/v1/app/macos/download",
    data: {},
  });

export const getAppVersion = () =>
  GET({
    url: "/api/v1/app/version",
    data: {},
  });
