import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import "bootstrap/dist/css/bootstrap.min.css";
import {QueryClient, QueryClientProvider} from "react-query";
import "styles/base.scss";

// `cacheTime`: When all components that used instance of specific query have been unmounted, cacheTime is triggered i.e.
// data are cached for `cacheTime`ms. If the component that has this instance of query has been re-mounted, cacheTime
// is being 'restarted' to its initial value provided in the options.
// Full caching explanation of react-query: https://react-query.tanstack.com/guides/caching
// All options can be manually changed for specific queries.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      cacheTime: 1000 * 30
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
