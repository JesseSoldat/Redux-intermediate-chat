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

const initialState = {
	activeThreadId: '1-fca2',
	threads: [
		{
			id: '1-fca2',
			title: 'Buzz Aldrin',
			messages: [
				{
					text: 'Twelve minutes to ignition',
					timestamp: Date.now(),
					id: uuid.v4(),
				}
			]
		},
		{
			id: '2-be91',
			title: 'Michael Collins',
			messages: [],
		},
	], 
}

const store = Redux.createStore(reducer, initialState);

class App extends React.Component {
	componentDidMount() {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const state = store.getState();
		const activeThreadId = state.activeThreadId;
		const threads = state.threads;
		const activeThread = threads.find((t) => t.id === activeThreadId);

		const tabs = threads.map(t => (
			{
				title: t.title,
				active: t.id === activeThreadId
			}
		));

		return (
			<div className='ui segment'>
				<ThreadTabs tabs={tabs} />
				<Thread thread={activeThread} />
			</div>
		);
	}
}

class ThreadTabs extends React.Component {
	render() {
		const tabs = this.props.tabs.map((tab, i) => (
			<div key={i} 
				className={tab.active ? 'active item' : 'item'}
			>
				{tab.title}
			</div>
		));
		return (
			<div className='ui top attached tabular menu'>
				{tabs}
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

class Thread extends React.Component {
	handleClick(id) {
		store.dispatch({
      type: 'DELETE_MESSAGE',
      id: id,
    });
	}

	render() {
		const messages = this.props.thread.messages.map((msg, i) => (
			<div className='comment' key={i}
				onClick={() => this.handleClick(msg.id)}
			>
				<div className='text'>
					{msg.text}
					<span className='metadata'>@{msg.timestamp}</span>
				</div>
			</div>
		));
		return (
			<div className='ui center aligned basic segment'>
				<div className='ui comments'>
					{messages}
				</div>
				<MessageInput />
			</div>
		);
	}	
}




ReactDOM.render(<App/>, document.getElementById('content'));