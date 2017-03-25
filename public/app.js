function reducer(state, action) {
	return {
		activeThreadId: activeThreadIdReducer(state.activeThreadId, action),
		threads: threadsReducer(state.threads, action),
	};
}

function activeThreadIdReducer(state, action) {
	if(action.type === 'OPEN_THREAD'){
		return action.id;
	} else {
		return state;
	}
}

function threadsReducer(state, action) {
	if(action.type === 'ADD_MESSAGE') {
		const newMessage = {
			text: action.text,
			timestamp: Date.now(),
			id: uuid.v4(),
		};
		const threadIndex = state.findIndex(
			(t) => t.id === action.threadId
		);
		const oldThread = state[threadIndex];
		const newThread = {
			...oldThread,
			messages: oldThread.messages.concat(newMessage)
		};
		return [
			...state.slice(0, threadIndex),
			newThread,
			...state.slice(
				threadIndex + 1, state.length
			)
		];
	} else if (action.type === 'DELETE_MESSAGE') {
		const threadIndex = state.findIndex(
			(t) => t.messages.findIndex((m) => (
				m.id === action.id
			))
		);
		const oldThread = state[threadIndex];
		const messageIndex = oldThread.messages.findIndex(
			(m) => m.id === action.id
		);
		const messages = [
			...oldThread.messages.slice(0, messageIndex),
			...oldThread.messages.slice(messageIndex + 1, messages.length)
		];
		const newThread = {
			...oldThread,
			messages: messages
		};

		return [
			...state.slice(0, threadIndex),
			newThread,
			...state.slice(threadIndex + 1, state.length)
		];
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
          text: 'Twelve minutes to ignition.',
          timestamp: Date.now(),
          id: uuid.v4(),
        },
      ],
    },
    {
      id: '2-be91',
      title: 'Michael Collins',
      messages: [],
    },
  ],
};

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

		const tabs = threads.map((t) => (
			{
				 id: t.id,
				 title: t.title,
				 active: t.id === activeThreadId
			}
		));

		return (
			<div className='ui segment'>
				<ThreadTabs tabs={tabs} />
			</div>
		)
	}
}

class ThreadTabs extends React.Component {
	handleClick(id) {
		store.dispatch({
			type: 'OPEN_THREAD',
			id: id
		});
	}

	render() {
		const tabs = this.props.tabs.map((tab, i) => (
			<div key={i}
					className={tab.active ? 'active item' : 'item'}
					onClick={() => this.handleClick(tab.id)}
			> {tab.title}
			</div>
		));
		return (
			<div className='ui top attached tabular menu'>
				{tabs}
			</div>
		);
	}
}


ReactDOM.render(<App/>, document.getElementById('content'));