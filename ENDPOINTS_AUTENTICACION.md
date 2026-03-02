# Documentación de Endpoints para Autenticación

## Resumen
Esta es la documentación de los endpoints de autenticación que tu backend necesita implementar para que funcione el sistema de login en el frontend.

---

## 1. LOGIN - POST /login/

**Descripción:** Autentica un usuario y devuelve un token JWT.

**URL:** `POST /login/`

**Headers:**
```
Content-Type: application/json
```

**Body (Request):**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "demo",
    "nombre": "Usuario Demo",
    "rol": "usuario"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas",
  "message": "Usuario o contraseña incorrectos"
}
```

**Notas:**
- El token debe ser un JWT válido
- El token se guardará en localStorage y se usará en las siguientes peticiones
- El usuario debe ser retornado con al menos: id, username, nombre, rol

---

## 2. VERIFICAR AUTENTICACIÓN - GET /me/

**Descripción:** Verifica que el token sea válido y devuelve los datos del usuario autenticado.

**URL:** `GET /me/`

**Headers:**
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "demo",
  "nombre": "Usuario Demo",
  "rol": "usuario",
  "email": "demo@example.com"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "No autenticado",
  "message": "Token inválido o expirado"
}
```

**Notas:**
- Este endpoint se puede usar para validar el token
- Devuelve los datos actualizados del usuario

---

## Credenciales de Demo

### Usuario Demo
```
Usuario: demo
Contraseña: demo123
Rol: usuario
```

### Usuario Admin
```
Usuario: admin
Contraseña: admin123
Rol: admin
```

---

## Implementación Recomendada en Backend

### Con Django / Django REST Framework:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_jwt.views import ObtainJSONWebToken

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generar token
        token = generate_token(user)  # Tu función para generar JWT
        
        return Response({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'nombre': user.first_name or user.username,
                'rol': user.groups.first().name if user.groups.exists() else 'usuario'
            }
        })

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'nombre': user.first_name or user.username,
            'rol': user.groups.first().name if user.groups.exists() else 'usuario',
            'email': user.email
        })
```

### URL Routing:
```python
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    # ... otros endpoints
]
```

---

## Flujo de Autenticación en Frontend

```
1. Usuario ingresa credenciales en la página de login
2. Frontend hace POST /login/ con username y password
3. Backend valida y devuelve un token JWT
4. Frontend guarda el token en localStorage
5. Frontend redirige al dashboard
6. En cada petición a otros endpoints, se envía el token en el header Authorization
7. Al logout, se elimina el token de localStorage y se redirige al login
```

---

## Headers Requeridos para Peticiones Autenticadas

```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Ejemplo:**
```
GET /asuntos/ HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## CORS Requerido

El backend debe permitir CORS desde el frontend. Asegúrate de configurar:

```python
# Django CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://trekanpdti.systems",
    "http://localhost:5174",  # Para desarrollo local
]

CORS_ALLOW_CREDENTIALS = True  # Permitir envío de cookies y headers de autenticación
```

---

## Manejo de Errores

### Códigos HTTP esperados:

| Código | Significado | Acción del Frontend |
|--------|-------------|-------------------|
| 200    | OK          | Procesar response normalmente |
| 201    | Created     | Procesar response de creación |
| 400    | Bad Request | Mostrar error general |
| 401    | Unauthorized | Redirigir a login |
| 403    | Forbidden   | Mostrar error de permisos |
| 404    | Not Found   | Mostrar error 404 |
| 500    | Server Error| Mostrar error del servidor |

---

## Testing

Puedes probar los endpoints con curl:

```bash
# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# Verificar autenticación
curl -X GET http://localhost:8000/api/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notas Importantes

1. **Seguridad:** En producción, asegúrate de:
   - Usar HTTPS
   - Configurar CORS correctamente
   - Implementar token refresh
   - Validar todos los inputs

2. **Tokens JWT:** 
   - Deben tener una expiración razonable (ej: 24 horas)
   - Se pueden implementar refresh tokens para renovar sin hacer login de nuevo

3. **Roles y Permisos:**
   - El sistema de login incluye un campo "rol" para futuros controles de acceso
   - Se puede expandir para incluir permisos específicos

---

Contacta si tienes dudas sobre la implementación.
