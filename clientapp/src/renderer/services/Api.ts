interface ScreenshotUploadData {
  employee_id: string;
  organization_id: string;
  path: string;
  permission: boolean;
  os: string;
  geo_location: string;
  ip_address: string;
  app: string;
  tracking_id: string;
  project_id?: string;
  task_id?: string;
}

interface ClockInOutData {
  notes: string;
}

const API_URL = "http://127.0.0.1:8000/api/v1";

export const uploadScreenshot = async (
  data: ScreenshotUploadData
): Promise<any> => {
  const token = localStorage.getItem("momentum_tokens");
  const access_token = JSON.parse(token || "{}").access_token;
  try {
    const response = await fetch(`${API_URL}/screenshots/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading screenshot:", error);
    throw error;
  }
};

export const clockIn = async (
  employeeId: string,
  data: ClockInOutData
): Promise<any> => {
  const token = localStorage.getItem("momentum_tokens");
  const access_token = JSON.parse(token || "{}").access_token;
  console.log("token", token);
  try {
    const response = await fetch(
      `${API_URL}/time-tracking/clock-in/${employeeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error clocking in:", error);
    throw error;
  }
};

export const clockOut = async (
  employeeId: string,
  data: ClockInOutData
): Promise<any> => {
  const token = localStorage.getItem("momentum_tokens");
  const access_token = JSON.parse(token || "{}").access_token;
  try {
    const response = await fetch(
      `${API_URL}/time-tracking/clock-out/${employeeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error clocking out:", error);
    throw error;
  }
};

export const getPresignedUrl = async (
  fileName: string,
  contentType = "image/png"
): Promise<any> => {
  const token = localStorage.getItem("momentum_tokens");
  const access_token = JSON.parse(token || "{}").access_token;
  try {
    const response = await fetch(
      `${API_URL}/screenshots/s3/presigned-url?file_name=${fileName}&content_type=${contentType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

export const getTasks = async (employeeId: string): Promise<any> => {
  const token = localStorage.getItem("momentum_tokens");
  const access_token = JSON.parse(token || "{}").access_token;
  try {
    const response = await fetch(`${API_URL}/tasks/employee/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};
