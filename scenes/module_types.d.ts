/*
    Typescript не умеет импротить произвольные файлы, это делает сборкщик (parcel)
    Для тайпчекера объявим, что модули с картинками - это нормально
*/
declare module "*.png" {
    const value: any;
    export = value;
}