export type GoogleReview = {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
};

export type TestimonialResponse = {
  overallRating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  googleMapsUri: string;
};

export interface GoogleReviewData {
  overallRating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  googleMapsUri: string;
}

export interface GoogleReviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: GoogleReviewData;
}