export interface ISeatItemCheckOut {
    seatLabel: string;
    price: number;
    type: string;
}

export interface IPayloadCheckOut {
    showTimeId: string | undefined;
    customerInfo: {
        userName: string;
        phone: string;
        email: string;
    }
    movieId: string | undefined;
    roomId: string | undefined;
    roomName: string | undefined;
    movieName: string | undefined;
    moviePoster: string | undefined;
    items: ISeatItemCheckOut[];
    startTime: string | undefined;
    qrCode: string;
    totalPrice: number;
}