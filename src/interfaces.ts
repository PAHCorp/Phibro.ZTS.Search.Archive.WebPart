export interface IFAQ {
    Id: number;
    Title: string;
    Body: string; 
    Letter: string;
}

export interface IDECCOX_Binder_6_Percent {
    Id: number;
    "Order#": string;
    NodeType: string;
    NodeName: string;
    DocumentID: string;
    "Level#": number
    field_1: string;
    field_2: string;
    field_3: string;
    field_4: string;
}

export interface IDeccox_Export_Full_Source {
    Title: string;
    file: string;
}