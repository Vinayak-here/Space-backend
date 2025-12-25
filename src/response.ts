export const successResponse = (
  message: string,
  data: any = null,
  meta: any = null
) => ({
  success: true,
  message,
  data,
  error: null,
  meta,
});

export const errorResponse = (
  message: string,
  code = "INTERNAL_ERROR",
  details: any = null
) => ({
  success: false,
  message,
  data: null,
  error: {
    code,
    details,
  },
  meta: null,
});
