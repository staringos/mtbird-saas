import request from "@/utils/request";

export const getGoods = () => {
  return request.get(`/order/good/subscription`);
};

export const getOrder = (orderId: string) => {
  return request.get(`/order/${orderId}`);
};

export const goToPay = (orderId: string, payWay: string) => {
  return request.post(`/order/${orderId}/pay`, { payWay });
};

export const refreshOrderPayStatus = (
  id: string,
  ciphertext: string,
  associated_data: string,
  nonce: string,
  key: string
) => {
  return request.get(`/order/${id}/pay/status`, {
    ciphertext,
    associated_data,
    nonce,
    key,
  });
};

export const submitTransferCertificate = (id: string, urls: string[]) => {
  return request.post(`/order/${id}/pay/transfer`, {
    certificateUrl: urls.join(","),
  });
};

export const closeOrder = (id: string) => {
  return request.post(`/order/${id}/close`);
};

export const getRechargePlan = (platformId: number) => {
  return request.get(`/rechargePlan?platform=${platformId}`);
}


export const planPay = (planId: string, payWay: string, device: string, openId?: string) => {
  return request.post(`/rechargePlan/${planId}/pay`, {
    payWay,
    device,
    openId
  });
};
