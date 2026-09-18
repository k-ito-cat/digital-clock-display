import 'react';

/**
 * popover 属性は React 18 の型定義に含まれていないため補う。
 * React 19 へ上げる時点でこの宣言は不要になる。
 */
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | 'hint' | '';
  }
}
