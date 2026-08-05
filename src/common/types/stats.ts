export interface IOverviewStats {
  ticket: {
    total: number;
    previous: number;
    growth: number;
  };
  revenue: {
    total: number;
    previous: number;
    growth: number;
  };
  newUser: {
    total: number;
    previous: number;
    growth: number;
  };
}

export interface IOverviewStatsYearResult {
  month: string;
  revenue: number;
  tickets: number;
}

export interface IOverviewStatsYear {
  year: string;
  result: IOverviewStatsYearResult[];
}

export interface IOverviewTopMovie {
  queryTime: {
    from: string;
    to: string;
  };
  result: {
    movieName: string;
    revenue: number;
    totalTickets: number;
    movieId: string;
    poster?: string;
  }[];
}

export interface ITicketOverviewStats {
  totalTickets: number;
  totalRevenue: number;
  avgTicketsPerDay: number;
  peakHour: {
    hour: null | string;
    totalTickets: number;
  };
  topRoom: string | null;
}

export interface ITicketHourlyTrendItem {
  hour: string;
  totalTickets: number;
}

export interface ITicketHourlyTrendResponse {
  data: ITicketHourlyTrendItem[];
  peakHour: ITicketHourlyTrendItem | null;
  queryTime: {
    from: string;
    to: string;
  };
}

export interface ITopMovieResponse {
  totalTickets: number;
  data: {
    movieId: string;
    movieName: string;
    totalTickets: number;
    percentage: number;
  }[];
}

export interface ISeatTypeTrendResponse {
  totalTickets: number;
  data: {
    type: string;
    totalTickets: number;
    percentage: number;
  }[];
}

export interface IAdminDashboardOverview {
  summary: {
    movies: number;
    rooms: number;
    clients: number;
    tickets_paid_total: number;
    revenue_month: number;
    revenue_previous_month: number;
    revenue_growth_percent: number;
    revenue_selected_range: number;
    net_revenue_selected_range?: number;
    tickets_selected_range: number;
    paid_orders_selected_range?: number;
    sold_seats_selected_range?: number;
    seat_revenue_selected_range: number;
    product_revenue_selected_range: number;
    discount_selected_range: number;
    gross_revenue_selected_range: number;
    refund_selected_range?: number;
    tickets_today: number;
    paid_orders_today?: number;
    sold_seats_today?: number;
    showtimes_today: number;
    upcoming_showtimes: number;
    check_ins_today: number;
    pending_payments: number;
  };
  range: {
    period: string;
    from: string;
    to: string;
    revenue: number;
    net_revenue?: number;
    tickets: number;
    paid_orders?: number;
    sold_seats?: number;
    seat_revenue: number;
    product_revenue: number;
    discount_amount: number;
    refund_amount?: number;
    gross_revenue: number;
    average_order_value: number;
    average_ticket_value?: number;
  };
  today: {
    date: string;
    revenue: number;
    net_revenue?: number;
    seat_revenue: number;
    product_revenue: number;
    discount_amount: number;
    refund_amount?: number;
    gross_revenue: number;
    tickets: number;
    paid_orders?: number;
    sold_seats?: number;
    showtimes: number;
    check_ins: number;
  };
  upcoming_showtimes: {
    id: number | string;
    movie_name?: string | null;
    room_name?: string | null;
    projection_format?: string | null;
    start_time: string;
    end_time: string;
    status: string;
    is_booking_open: boolean;
    booking_closed_reason?: string | null;
  }[];
  top_movies: {
    movie_name: string;
    movie_poster?: string | null;
    total_tickets: number;
    revenue: number;
  }[];
  monthly_revenue: {
    month: string;
    revenue: number;
    tickets: number;
  }[];
  revenue_trend: {
    label: string;
    date: string;
    revenue: number;
    net_revenue?: number;
    seat_revenue: number;
    product_revenue: number;
    discount_amount: number;
    refund_amount?: number;
    gross_revenue: number;
    tickets: number;
    paid_orders?: number;
    sold_seats?: number;
  }[];
}
