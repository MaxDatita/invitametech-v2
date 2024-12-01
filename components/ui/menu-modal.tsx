'use client'

import { useState } from 'react'
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { ShoppingCart } from 'lucide-react'
import { theme } from '@/config/theme'

interface MenuItem {
  name: string
  price: number
  details?: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface MenuData {
  bebidas?: {
    alcoholicas: MenuSection
    sinAlcohol: MenuSection
  }
  comidas?: {
    entrada: MenuSection
    principal: MenuSection
    postre: MenuSection
  }
}

const defaultMenuData: MenuData = {
  bebidas: {
    alcoholicas: {
      title: "Bebidas con Alcohol",
      items: [
        { name: "Fernet con Coca", price: 2500 },
        { name: "Cerveza Quilmes", price: 1800 },
        { name: "Vino Tinto", price: 2000, details: "Copa" },
        { name: "Vino Blanco", price: 2000, details: "Copa" }
      ]
    },
    sinAlcohol: {
      title: "Bebidas sin Alcohol",
      items: [
        { name: "Coca Cola", price: 1200, details: "Vaso" },
        { name: "Sprite", price: 1200, details: "Vaso" },
        { name: "Agua Mineral", price: 800, details: "500ml" },
        { name: "Jugo de Naranja", price: 1000 }
      ]
    }
  },
//   comidas: {
//     entrada: {
//       title: "Entrada",
//       items: [
//         { name: "Empanadas de Carne", price: 800, details: "unidad" },
//         { name: "Empanadas J&Q", price: 800, details: "unidad" },
//         { name: "Chips y Snacks", price: 1200, details: "porción" }
//       ]
//     },
//     principal: {
//       title: "Plato Principal",
//       items: [
//         { name: "Asado", price: 5500, details: "porción" },
//         { name: "Choripán", price: 2500 },
//         { name: "Ensaladas Variadas", price: 1800 }
//       ]
//     },
//     postre: {
//       title: "Postre",
//       items: [
//         { name: "Helado", price: 2000, details: "2 bochas" },
//         { name: "Torta de Chocolate", price: 1800, details: "porción" },
//         { name: "Frutas de Estación", price: 1500 }
//       ]
//     }
//   }
}

interface MenuSectionProps {
  section: MenuSection
}

const MenuSection = ({ section }: MenuSectionProps) => (
  <div className="bg-muted rounded-lg p-4">
    <h3 className="font-semibold mb-2">{section.title}</h3>
    <ul className="space-y-2">
      {section.items.map((item, index) => (
        <li key={index} className="flex justify-between items-center">
          <span>{item.name}{item.details ? ` (${item.details})` : ''}</span>
          <span className="font-semibold">${item.price}</span>
        </li>
      ))}
    </ul>
  </div>
)

interface MenuModalProps {
  data?: MenuData
  buttonText?: string
}

export function MenuModal({ data = defaultMenuData, buttonText = "Bebidas" }: MenuModalProps) {
  const hasBebidas = !!data.bebidas
  const hasComidas = !!data.comidas
  const [selectedTab, setSelectedTab] = useState<'bebidas' | 'comidas'>(hasBebidas ? 'bebidas' : 'comidas')
  
  // Verificar si el contenido está activo
  const contentActivationDate = new Date(theme.dates.contentActivation)
  const isContentActive = new Date() >= contentActivationDate

  const getModalTitle = () => {
    if (hasBebidas && hasComidas) return "Bebidas y Comidas"
    if (hasBebidas) return "Bebidas"
    if (hasComidas) return "Comidas"
    return buttonText
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" className="w-full flex items-center justify-center">
          <ShoppingCart className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">{getModalTitle()}</DialogTitle>
        </DialogHeader>
        
        {isContentActive ? (
          <>
            {hasBebidas && hasComidas && (
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant={selectedTab === 'bebidas' ? "primary" : "secondary"}
                  className="flex-1"
                  onClick={() => setSelectedTab('bebidas')}
                >
                  Bebidas
                </Button>
                <Button 
                  variant={selectedTab === 'comidas' ? "primary" : "secondary"}
                  className="flex-1"
                  onClick={() => setSelectedTab('comidas')}
                >
                  Comidas
                </Button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 pr-2">
              {data.bebidas && ((!hasComidas || selectedTab === 'bebidas') ? (
                <div className="space-y-4">
                  <MenuSection section={data.bebidas.alcoholicas} />
                  <MenuSection section={data.bebidas.sinAlcohol} />
                </div>
              ) : null)}

              {data.comidas && ((!hasBebidas || selectedTab === 'comidas') ? (
                <div className="space-y-4">
                  <MenuSection section={data.comidas.entrada} />
                  <MenuSection section={data.comidas.principal} />
                  <MenuSection section={data.comidas.postre} />
                </div>
              ) : null)}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-center p-4">
            <p className="text-muted-foreground">
              El menú de consumibles estará disponible más cerca de la fecha del evento.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 