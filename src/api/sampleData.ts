import { apiRequest } from "./client";

export const addSampleData = () =>
  apiRequest<void>({
    url: "/api/me/sample-data",
    method: "POST",
  });
