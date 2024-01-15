import Board from "./Board";
import { debug, setDebug } from "./state";

export default function App() {
  return (
    <main class="flex h-full w-full items-center justify-center bg-blue-600">
      <Board />

      <label class="absolute left-10 top-10 inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={debug()}
          class="peer sr-only"
          onChange={({ target }) => setDebug(target.checked)}
        />
        <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full" />
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
      </label>
    </main>
  );
}
