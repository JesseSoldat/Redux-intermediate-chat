const reducer = Redux.combineReducers({
	activeThreadId: activeThreadIdReducer,
	threads: threadsReducer
});

function activeThreadIdReducer(state = '1-fca2', action) {
	if(action.type === 'OPEN_THREAD') {
		return action.id;
	} else {
		return state;
	}
}

function findThreadIndex(threads, action) {
	switch (action.type) {
		case 'ADD_MESSAGE': {
			return threads.findIndex(
				(t) => t.id === action.threadId
			);
		}
		case 'DELETE_MESSAGE': {
			return threads.findIndex(
				(t) => t.messages.find(
					(m) => m.id === action.id
				)
			);
		}
	}
}

function threadsReducer(state =[
	{
    id: '1-fca2',
    title: 'Buzz Aldrin',
    messages: messagesReducer(undefined, {}),
  },
  {
    id: '2-be91',
    title: 'Michael Collins',
    messages: messagesReducer(undefined, {}),
  },
], action) {
	switch (action.type) {
		case 'ADD_MESSAGE':
		case 'DELETE_MESSAGE': {
			const threadIndex = findThreadIndex(state, action);

			const oldThread = state[threadIndex];
			const newThread = {
				...oldThread,
				messages: messagesReducer(oldThread.messages, action)
			};

			return [
				...state.slice(0, threadIndex),
				newThread,
				...state.slice(threadIndex + 1, state.length)
			];	
		}
		default: {
			return state;
		}
	}
}

function messagesReducer(state = [], action) {
	switch(action.type) {
		case 'ADD_MESSAGE': {
			const newMessage = {
				text: action.text,
				timestamp: Date.now(),
				id: uuid.v4()
			};
			return state.concat(newMessage);
		}
		case 'DELETE_MESSAGE': {
			const messageIndex = state.findIndex((m) => m.id === action.id);
			return [
				...state.slice(0, messageIndex),
				...state.slice(messageIndex + 1, state.length)
			];
		}
		default: {
			return state;
		}
	}
}


const store = Redux.createStore(reducer);

class App extends React.Component {
	componentDidMount() {
		store.subscribe(() => this.forceUpdate());
	}

	render() {
		const state = store.getState();
		const activeThreadId = state.activeThreadId;
		const threads = state.threads;
		const activeThread = threads.find((t) => t.id === activeThreadId);

		const tabs = threads.map((t) => (
			{
				title: t.title,
				id: t.id,
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
	handleClick(id) {
		store.dispatch({
			type: 'OPEN_THREAD',
			id: id
		});
	};

	render() {
		const tabs = this.props.tabs.map((tab, i) => (
			<div key={i} className={tab.active ? 'active item' : 'item'}
				onClick={() => this.handleClick(tab.id)}>
				{tab.title}
			</div>
		));
		return (
			<div className='ui top attached tabular menu'>
				{tabs}
			</div>
		)
	}
}

class MessageInput extends React.Component {
	handleSubmit() {
		store.dispatch({
			type: 'ADD_MESSAGE',
			text: this.refs.messageInput.value,
			threadId: this.props.threadId
		});
		this.refs.messageInput.value = '';

	}

	handleEnter(e) {
		if(e.charCode === 13){
			this.handleSubmit();
		}
	}

	render() {
		return (
			<div className='ui input' >
				<input onKeyPress={this.handleEnter.bind(this)}
					ref='messageInput'
					type='text'
					/>
				<button type='submit' 
					className='ui button primary'
					onClick={this.handleSubmit.bind(this)}
					>
					Submit
				</button>
			</div>
		)
	}
}

class Thread extends React.Component {
	handleClick(id) {
		store.dispatch({
			type: 'DELETE_MESSAGE',
			id: id
		});
	}

	render() {
		const messages = this.props.thread.messages.map((msg, i) => (
			<div key={i} onClick={() => this.handleClick(msg.id)}
				className='comment'>
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
				<MessageInput threadId={this.props.thread.id} />
			</div>
		);
	}
}

ReactDOM.render(<App/>, document.getElementById('content'));