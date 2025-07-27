export const errorResponse = (message: string) => {
    return {
      error: true,
      message: message,
    };
  };
  
  export const successResponse = (data: any) => {
    return {
      success: true,
      data,
    };
  };