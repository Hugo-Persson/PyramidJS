 // Method Decorator
export function Confirmable(message: string) {
  return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

      descriptor.value = function( ... args: any[]) {
          const allow = confirm(message);

          if (allow) {
            const result = original.apply(this, args);
            return result;
          } else {
            return null;
          }
    };

    return descriptor;
  };
}