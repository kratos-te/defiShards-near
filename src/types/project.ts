type LoadingResult = {
  isLoading: true;
  isError: false;
};

type ErrorLoadingResult = {
  isLoading: false;
  isError: true;
  error: string;
};

type LoadedResult<T> = {
  isLoading: false;
  isError: false;
  value: T;
};

export type LoadableResult<T> = LoadingResult | ErrorLoadingResult | LoadedResult<T>;
