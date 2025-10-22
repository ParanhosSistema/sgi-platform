import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MapaService {
  constructor(private readonly prisma: PrismaService) {}

  // Coordenadas aproximadas dos municípios do Paraná (capitais regionais e alguns principais)
  // Para produção, estas coordenadas devem ser armazenadas no banco de dados
  private readonly coordenadasMunicipios: Record<string, [number, number]> = {
    // Norte Pioneiro
    'Abatiá': [-50.3089, -23.3047],
    'Andirá': [-50.2331, -23.0525],
    'Assaí': [-50.8456, -23.3708],
    'Bandeirantes': [-50.3692, -23.1094],
    'Cambará': [-50.0803, -23.0364],
    'Cornélio Procópio': [-50.6478, -23.1808],
    'Ibaiti': [-50.1944, -23.8519],
    'Jaboti': [-50.0856, -23.7442],
    'Jacarezinho': [-49.9711, -23.1622],
    'Joaquim Távora': [-49.9275, -23.4986],
    'Pinhalão': [-50.0564, -23.7964],
    'Ribeirão Claro': [-49.7617, -23.1933],
    'Santo Antônio da Platina': [-50.0786, -23.2961],
    'São José da Boa Vista': [-49.6361, -23.8608],
    'Siqueira Campos': [-49.9281, -23.6931],
    'Tomazina': [-49.9531, -23.7756],
    'Wenceslau Braz': [-49.8042, -23.8689],
    
    // Curitiba e Região Metropolitana
    'Curitiba': [-49.2733, -25.4295],
    'Almirante Tamandaré': [-49.3094, -25.3244],
    'Araucária': [-49.4108, -25.5931],
    'Balsa Nova': [-49.6372, -25.5794],
    'Bocaiúva do Sul': [-49.1167, -25.2083],
    'Campina Grande do Sul': [-49.0544, -25.3056],
    'Campo Largo': [-49.5272, -25.4594],
    'Campo Magro': [-49.4428, -25.3575],
    'Colombo': [-49.2239, -25.2919],
    'Contenda': [-49.5353, -25.6694],
    'Fazenda Rio Grande': [-49.3083, -25.6619],
    'Itaperuçu': [-49.3467, -25.2192],
    'Mandirituba': [-49.3289, -25.7794],
    'Pinhais': [-49.1919, -25.4447],
    'Piraquara': [-49.0628, -25.4422],
    'Quatro Barras': [-49.0772, -25.3661],
    'Quitandinha': [-49.4956, -25.8714],
    'Rio Branco do Sul': [-49.3131, -25.1908],
    'São José dos Pinhais': [-49.2064, -25.5319],
    'Tijucas do Sul': [-49.1981, -25.9264],
    'Tunas do Paraná': [-49.0983, -25.0244],
    
    // Londrina e Região Norte
    'Londrina': [-51.1628, -23.3103],
    'Cambé': [-51.2778, -23.2761],
    'Ibiporã': [-51.0506, -23.2714],
    'Rolândia': [-51.3667, -23.3097],
    'Arapongas': [-51.4244, -23.4194],
    'Apucarana': [-51.4611, -23.5508],
    'Maringá': [-51.9389, -23.4208],
    'Sarandi': [-51.8756, -23.4425],
    'Paiçandu': [-52.0467, -23.4578],
    
    // Oeste
    'Cascavel': [-53.4553, -24.9558],
    'Foz do Iguaçu': [-54.5853, -25.5469],
    'Toledo': [-53.7425, -24.7136],
    'Marechal Cândido Rondon': [-54.0564, -24.5558],
    
    // Sudoeste
    'Francisco Beltrão': [-53.0547, -26.0808],
    'Pato Branco': [-52.6708, -26.2286],
    'Dois Vizinhos': [-53.0569, -25.7383],
    
    // Sul
    'Paranaguá': [-48.5222, -25.5161],
    'Antonina': [-48.7122, -25.4289],
    'Guaratuba': [-48.5747, -25.8828],
    'Morretes': [-48.8331, -25.4756],
    'Guaraqueçaba': [-48.3194, -25.2961],
    'Pontal do Paraná': [-48.5094, -25.6708],
    'Matinhos': [-48.5444, -25.8175],
    
    // Centro
    'Ponta Grossa': [-50.1611, -25.0947],
    'Castro': [-50.0119, -24.7911],
    'Carambeí': [-50.0983, -24.9172],
    'Piraí do Sul': [-49.9481, -24.5264],
    
    // Centro-Sul
    'Guarapuava': [-51.4581, -25.3908],
    'Prudentópolis': [-50.9781, -25.2133],
    'Irati': [-50.6519, -25.4681],
    
    // Noroeste
    'Paranavaí': [-52.4656, -23.0728],
    'Umuarama': [-53.3253, -23.7664],
    'Cianorte': [-52.6050, -23.6636],
  };

  async getMunicipiosGeoJSON() {
    const municipios = await this.prisma.municipio.findMany({
      include: {
        territorio: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const features = municipios.map((municipio) => {
      const coords = this.coordenadasMunicipios[municipio.nome] || [-50.0, -25.0]; // Default para centro do PR
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords, // [longitude, latitude]
        },
        properties: {
          id: municipio.id,
          ibge: municipio.ibgeCode ? municipio.ibgeCode.toString() : null,
          nome: municipio.nome,
          territorio: municipio.territorio?.nome || null,
          territorioId: municipio.territorioId,
          classificacao: 'BRONZE', // Padrão, pode ser atualizado futuramente
          coords: coords,
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features: features,
    };
  }
}
