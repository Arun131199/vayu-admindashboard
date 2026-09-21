import type { GoogleReviewResponse } from "../interfaces/testimonialResponse";
import api from "./api";


export async function getTestimonal(): Promise<GoogleReviewResponse> {
  const response = await api.get<GoogleReviewResponse>(
    "/v1/reviews/google"
  );

  return response.data;
}