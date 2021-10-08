export class UserDTO {
    username: string;
    password: string;
    email: string;
}

export class ReviewDTO {
    book_id: number;
    title: string;
    rating: number;
    is_publisher_review: boolean;
    content: string;
    book_publisher_id: number;
    created_at?: Date;
    updated_at?: Date;
}
