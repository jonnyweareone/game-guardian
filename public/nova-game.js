// Nova Game SDK - Event tracking for educational games
(function() {
  let bearerToken = null;

  window.NovaGame = {
    init: function(config) {
      bearerToken = config.bearerToken;
      console.log('Nova Game SDK initialized');
    },

    levelComplete: function(data) {
      this._emit('level_complete', data);
    },

    projectSubmit: function(data) {
      this._emit('project_submit', data);
    },

    bookPageRead: function(data) {
      this._emit('book_read_pages', data);
    },

    _emit: async function(eventType, data) {
      if (!bearerToken) {
        console.warn('Nova Game SDK: No bearer token set, cannot emit events');
        return;
      }

      try {
        const response = await fetch('/api/nova-game-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
          },
          body: JSON.stringify({
            child_id: this._getChildIdFromToken(),
            game: data.game || 'Unknown',
            event_type: eventType,
            event_data: data
          })
        });

        if (!response.ok) {
          console.error('Nova Game SDK: Failed to emit event', response.status);
        }
      } catch (error) {
        console.error('Nova Game SDK: Error emitting event', error);
      }
    },

    _getChildIdFromToken: function() {
      if (!bearerToken) return null;
      try {
        const payload = JSON.parse(atob(bearerToken.split('.')[1]));
        return payload.child_id;
      } catch (e) {
        console.error('Nova Game SDK: Invalid token format');
        return null;
      }
    }
  };
})();