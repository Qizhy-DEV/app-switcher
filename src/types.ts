export interface AppItem {
  name: string
  url: string
  icon: string
}

export interface AppConfig {
  title: string
  apps: AppItem[]
}
