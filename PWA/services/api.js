import axios from "axios";



const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

export const getAddresses = async () => {
    const response = await api.get('/batches/assigned?brigadeId=b4e14795-7a55-48fc-bb87-f7c7930de6ff')

    console.log(response.data);

    return response.data
}

export const makeReport = async ({id, idb, query}) => {
    console.log(id);

    const response = await api.post(`/batches/${idb}/addresses/${id}/report`, query)

    console.log(response.data);

    return response.data;
}