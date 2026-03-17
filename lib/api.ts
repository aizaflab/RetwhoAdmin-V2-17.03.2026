// import "server-only";

const API_URL: string = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

export async function getData<T>(
  queryString: string,
): Promise<ApiResponse<T> | null> {
  try {
    const response = await fetch(`${API_URL}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
