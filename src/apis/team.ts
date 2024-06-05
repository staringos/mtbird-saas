import request from "@/utils/request";

export const getMemberList = (teamId: string) => {
  return request.get(`/team/${teamId}/members`);
};

export const inviteMember = (teamId: string, phone: string) => {
  return request.post(`/team/${teamId}/invite`, { phone });
};

export const deleteMember = (teamId: string, userId: string) => {
  return request.delete(`/team/${teamId}/members`, {
    data: { targetUserId: userId },
  });
};

export const updateTeamProfile = (
  teamId: string,
  name: string,
  avatar: string
) => {
  return request.put(`/team/${teamId}/profile`, { name, avatar });
};

export const getTeam = (teamId: string) => {
  return request.get(`/team/${teamId}`);
};

export const getTeamCompanies = (teamId: string) => {
  return request.get(`/team/${teamId}/company`);
};

export const addTeamCompany = (teamId: string, data: any) => {
  return request.post(`/team/${teamId}/company`, data);
};

export const takeOrder = (data: {
  price: number;
  teamId: string;
  times: number;
  companyName: string;
  contact: string;
  version: "enterprise" | "professional";
  period: "monthly" | "yearly";
}) => {
  const { teamId, times, version, period, companyName, contact, price } = data;
  return request.post(`/team/${teamId}/subscription/order`, {
    times,
    version,
    period,
    companyName,
    contact,
    price,
  });
};
