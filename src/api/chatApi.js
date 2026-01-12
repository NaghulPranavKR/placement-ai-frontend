import API from "./api";

export const getChats = () => API.get("/api/chat");
export const createChat = () => API.post("/api/chat/new");
export const getMessages = (chatId) =>
  API.get(`/api/chat/${chatId}/messages`);
export const sendMessage = (chatId, text) =>
  API.post(`/api/chat/${chatId}/message`, { text });

export const deleteChat = (chatId) =>
  API.delete(`/api/chat/${chatId}`);

export const renameChat = (chatId, title) =>
  API.put(`/api/chat/${chatId}/rename`, { title });
