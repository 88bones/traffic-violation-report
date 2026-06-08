export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
) => {
  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data: { type: "report_status" },
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  console.log("Push sent:", data);
  return data;
};
