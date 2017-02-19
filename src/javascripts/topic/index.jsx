var React = require('react');

window.socket = io.connect('/topic', { query: { id: document.body.dataset.id } });

window.current_user_id = document.body.dataset.uid;

var App = require('./components/App.jsx');

React.render(<App />, document.body);
