import type { GoogleReviewResponse } from "../interfaces/TestimonialResponse";
import api from "./api";


export async function getTestimonal(): Promise<GoogleReviewResponse> {
  const response = await api.get<GoogleReviewResponse>(
    "/v1/reviews/google"
  );

  return response.data;
}