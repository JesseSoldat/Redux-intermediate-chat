function reducer(state, action) {
	if(action.type === 'ADD_MESSAGE') {
		const newMessage = {
			text: action.text,
			timestamp: Date.now(),
			id: uuid.v4(),
		};
		return {
			messages: state.messages.concat(newMessage)
		};
	} else if (action.type === 'DELETE_MESSAGE') {
			const index = state.messages.findIndex(
				(m) => m.id === action.id
			);
		return {
			messages: [
				...state.messages.slice(0, index),
				...state.messages.slice(action.index + 1, messages.length)
			]
		};
	} else {
		return state;
	}
}

const initialState = { messages: [] };

const store = Redux.createStore(reducer, initialState);

class App extends React.Component {
	componentDidMount() {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const messages = store.getState().messages;

		return (
			<div className='ui segment'>
				<MessageView messages={messages} />
				<MessageInput/>
			</div>
		);
	}
}

class MessageInput extends React.Component {

	handleSubmit() {
		store.dispatch({
			type: 'ADD_MESSAGE',
			text: this.refs.messageInput.value
		});
		this.refs.messageInput.value = '';
	};

	render() {
		return (
			<div className='ui input'>
				<input ref='messageInput' type='text' />
				<button onClick={this.handleSubmit.bind(this)}
					className="ui primary button" type="submit">
					Submit
				</button>
			</div>
		);
	}
}

class MessageView extends React.Component {
	handleClick(id) {
		store.dispatch({
			type: 'DELETE_MESSAGE',
			id: id
		});
	};

	render() {
		const messages = this.props.messages.map((msg, i) => (
			<div className='comment' key={i} onClick={() => this.handleClick(msg.id)}>
				{msg.text}
				<span className='metadata'>@{msg.timestamp}</span>
			</div>
		));
		return (
			<div className='ui center aligned basic segment'>
				<div className='ui comments'>
					{messages}
				</div>
			</div>
		);
	}
}

ReactDOM.render(<App/>, document.getElementById('content'));