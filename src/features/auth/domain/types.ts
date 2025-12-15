export type User = {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
};

export type UserCredentials = {
    email: string;
    password: string;
};

export type RegisterData = {
    email: string;
    password: string;
    name: string;
};

export type AuthSession = {
    userId: string;
    email: string;
    name: string;
};

