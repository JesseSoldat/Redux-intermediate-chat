const reducer = Redux.combineReducers({
	activeThreadId: activeThreadIdReducer,
	threads: threadsReducer,
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
			return threads.findIndex(t => t.id === action.threadId);
		}
		case 'DELETE_MESSAGE': {
			return threads.findIndex(t => t.messages.find(m => m.id === action.id));
		}
	}
}

function threadsReducer(state = [
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
], action ) {
	switch (action.type) {
		case 'ADD_MESSAGE':
		case 'DELETE_MESSAGE': {
			const threadIndex = findThreadIndex(state, action);
			const oldThread = state[threadIndex];
			const newThread = {
				...oldThread,
				messages: messagesReducer(oldThread.messages, action),
			}
			return [
				...state.slice(0, threadIndex),
				newThread,
				...state.slice(threadIndex + 1, state.length)
			];
		}
		default:
			return state;
	}
}

function messagesReducer(state = [], action) {
	switch (action.type) {
		case 'ADD_MESSAGE': {
			const newMessage = {
				text: action.text,
				timestamp: Date.now(),
				id: uuid.v4()
			};
			return state.concat(newMessage);
		}
		case 'DELETE_MESSAGE': {
			const messageIndex = state.findIndex(m => m.id === action.id);
			return [
				...state.slice(0, messageIndex),
				...state.slice(messageIndex + 1, state.length)
			];
		}
		default:
			return state;
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
		const activeThread = threads.find(t => t.id === activeThreadId);

		const tabs = threads.map((tab, i) => (
			{
				title: tab.title,
				id: tab.id,
				active: tab.id === activeThreadId,
			}
		));
		return (
			<div className='ui segment'>
				<ThreadTabs tabs={tabs} />
				<ThreadDisplay thread={activeThread} activeThreadId={activeThreadId} />
			</div>
		);
	}
}

const Tabs = (props) => (
	<div className='ui top attached tabular menu'>
		{
			props.tabs.map((tab,i) => (
				<div className={tab.active ? 'active item' : 'item'}
					key={i} onClick={() => props.onClick(tab.id)}
				>
					{tab.title}
				</div>
			))

		}
	</div>
);

class ThreadTabs extends React.Component {
	render() {
		return (
			<Tabs tabs={this.props.tabs}
				onClick={(id) => (
					store.dispatch({
						type: 'OPEN_THREAD',
						id: id,
					})
				)}
			/>
		)
	}
}

const TextFieldSubmit = (props) => {
	let input;

	return (
		<div className='ui input'>
			<input ref={node => input = node} type='text' 
				onKeyPress={props.handleEnter.bind(this)}/>
			<button onClick={() => {
				props.onSubmit(input.value);
				input.value = '';
			}}
			className='ui primary button' type='submit'
			>
				Submit
			</button>
		</div>
	);
}

const MessageList = (props) => (
	<div className='ui comments'>
		{
			props.messages.map((m, i) => (
				<div className='comment' key={i}
					onClick={() => props.onClick(m.id)}
				>
					<div className='text'>
						{m.text}
						<span className='metadata'>@{m.timestamp}</span>
					</div>
				</div>
			))
		}
	</div>
);

const Thread = (props) => (
	<div className='ui center aligned basic segment'>
		<MessageList messages={props.thread.messages}
			onClick={props.onMessageClick}
		/>
		<TextFieldSubmit onSubmit={props.onMessageSubmit}
			handleEnter={props.handleEnter}	
		/>
	</div>
);

class ThreadDisplay extends React.Component {
	render() {
		return (
			<Thread thread={this.props.thread}
				onMessageClick={(id) => (
					store.dispatch({
						type: 'DELETE_MESSAGE',
						id: id,
					})
				)}
				onMessageSubmit={(text) => (
					store.dispatch({
						type: 'ADD_MESSAGE',
						text: text,
						threadId: this.props.activeThreadId
					})
				)}
				handleEnter={(e) => {
					if(e.charCode === 13) {
						store.dispatch({
							type: 'ADD_MESSAGE',
							text: e.target.value,
							threadId: this.props.activeThreadId
						});
						e.target.value = '';
					}
				}}
			/>
		);
	}
}

ReactDOM.render(<App/>, document.getElementById('content'));