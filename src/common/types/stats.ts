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
