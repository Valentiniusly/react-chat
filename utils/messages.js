const messages = [];

function formatMessage({ username, room, text, type }) {
  const msg = {
    username,
    room,
    text,
    type,
    time: new Date().toLocaleTimeString('ca', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
  };
  messages.push(msg);
  return msg;
}

function getOldMessages(room) {
  return messages.filter((msg) => msg.room === room);
}

module.exports = { formatMessage, getOldMessages };
