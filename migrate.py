import psycopg2
from psycopg2 import sql

# Conexión local
local_conn = psycopg2.connect(
    host="localhost",
    port=5433,
    user="postgres",
    password="2077",  # Cambiar por tu contraseña
    database="bd_muni"
)

# Conexión Railway
railway_conn = psycopg2.connect(
    host="ballast.proxy.rlwy.net",
    port=51424,
    user="postgres",
    password="jmDBDlhVcubZYEgPlfRkBCActnpRpwuF",
    database="railway"
)

local_cur = local_conn.cursor()
railway_cur = railway_conn.cursor()

# Tablas en orden (por dependencias)
tablas = ["personas", "asuntos", "asunto_instancia", "asistencia"]

for tabla in tablas:
    print(f"Migrando {tabla}...")
    
    # Obtener datos de local
    local_cur.execute(f"SELECT * FROM {tabla}")
    filas = local_cur.fetchall()
    
    # Obtener columnas
    columnas = [desc[0] for desc in local_cur.description]
    
    # Insertar en Railway
    for fila in filas:
        placeholders = ", ".join(["%s"] * len(columnas))
        insert_sql = sql.SQL(f"INSERT INTO {tabla} ({', '.join(columnas)}) VALUES ({placeholders})")
        try:
            railway_cur.execute(insert_sql, fila)
        except Exception as e:
            print(f"Error insertando en {tabla}: {e}")
    
    railway_conn.commit()
    print(f"✓ {tabla}: {len(filas)} registros migrados")

local_cur.close()
railway_cur.close()
local_conn.close()
railway_conn.close()

print("✓ Migración completada")