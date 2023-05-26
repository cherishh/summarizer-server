export const getMessages = (content: string, messages) => {
  const assembleMsg = content.split('\n').map((message) => {
    return {
      role: 'user',
      content: message,
    };
  });
  return [...messages, assembleMsg(content)];
}