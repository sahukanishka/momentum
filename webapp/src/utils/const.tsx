export const BASE_URL = "http://127.0.0.1:8000";
export const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export const fetchData = async (
  fetchFunction: (...rest: any) => Promise<any>,
  successCallback: (data: any) => void,
  errorCallback: (error: any) => void,
  ...rest: any[]
) => {
  try {
    const response = await fetchFunction(...rest);
    if (response.status === 200) {
      successCallback(response.data);
    } else {
      errorCallback(new Error("Failed to fetch data"));
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const patchData = async (
  patchFunction: (data: any, agent_id: any) => Promise<any>, // Ensure proper function signature
  successCallback: (data: any) => void,
  errorCallback: (error: any) => void,
  ...rest: [any, any] // Additional arguments
) => {
  try {
    const response = await patchFunction(...rest); // Execute patch function with args

    if (response?.status === 200) {
      successCallback(response.data);
    } else {
      errorCallback(new Error("Failed to fetch data"));
    }
  } catch (error) {
    errorCallback(error);
  }
};
export const postData = async (
  postFunction: (...data: any) => Promise<any>, // Ensure proper function signature
  successCallback: (data: any) => void,
  errorCallback: (error: any) => void,
  ...rest: any[] // Additional arguments
) => {
  try {
    const response = await postFunction(...rest); // Execute patch function with args
    console.log("-->", response);
    if (response?.status === 200) {
      successCallback(response.data);
    } else {
      throw new Error(response?.data?.message || "Failed to post data");
    }
  } catch (error) {
    errorCallback(error);
  }
};

export const formatDate = (seconds: number) => {
  if (seconds >= 3600)
    return `${Math.floor(seconds / 3600)}h ${Math.floor(
      (seconds % 3600) / 60
    )}m`;
  else if (seconds >= 60)
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  else return `${Math.floor(seconds)}s`;
};

export const getLanguages = (language: string) => {
  if (language === "en") return "English";
  else if (language === "hi") return "Hindi";
  else return language;
};

export const capitalize = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const convertSecondsToMinutes = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins} min${mins !== 1 ? "s" : ""} ${secs} sec${
    secs !== 1 ? "s" : ""
  }`;
};

function makeRenderableHTML(rawHtml) {
  const unescaped = rawHtml
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  const bodyMatch = unescaped.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : unescaped;

  const styleMatch = unescaped.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? styleMatch[0] : "";

  return styles + "\n" + bodyContent;
}
export const utils = {
  fetchData,
  patchData,
  postData,
  formatDate,
  getLanguages,
  capitalize,
  convertSecondsToMinutes,
  makeRenderableHTML,
};
