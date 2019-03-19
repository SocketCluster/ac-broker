module.exports = function (agBroker) {
  let hasSeenAllowOnceChannelAlready = false;

  agBroker.addMiddleware(agBroker.MIDDLEWARE_SUBSCRIBE, async (req) => {
    if (req.channel === 'allowOnce') {
      if (hasSeenAllowOnceChannelAlready) {
        let onlyOnceError = new Error('Can only subscribe once to the allowOnce channel')
        onlyOnceError.name = 'OnlyOnceError';
        throw onlyOnceError;
      }
      hasSeenAllowOnceChannelAlready = true;
    }
    if (req.channel === 'badChannel') {
      throw new Error('bad channel');
    }

    if (req.channel === 'delayedChannel') {
      await wait(500);
    }
  });

  agBroker.addMiddleware(agBroker.MIDDLEWARE_PUBLISH_IN, async (req) => {
    if (req.channel === 'silentChannel') {
      throw new Error('silent channel');
    } else if (req.command.value === 'test message') {
      req.command.value = 'transformed test message';
    }

    if (req.channel === 'delayedChannel') {
      await wait(500);
    }
  });

  // Ensure middleware can be removed
  let badMiddleware = async (req) => {
    throw new Error('This code should be unreachable!');
  };
  agBroker.addMiddleware(agBroker.MIDDLEWARE_SUBSCRIBE, badMiddleware);
  agBroker.addMiddleware(agBroker.MIDDLEWARE_PUBLISH_IN, badMiddleware);
  agBroker.removeMiddleware(agBroker.MIDDLEWARE_SUBSCRIBE, badMiddleware);
  agBroker.removeMiddleware(agBroker.MIDDLEWARE_PUBLISH_IN, badMiddleware);
};

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
