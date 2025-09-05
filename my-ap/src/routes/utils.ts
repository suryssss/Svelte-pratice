export function throwNull<T>(nullable: T, name: string) {
    if (nullable === null) throw new Error(name + " is null");
    return nullable;
}