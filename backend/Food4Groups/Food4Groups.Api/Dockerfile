FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Food4Groups.Api/Food4Groups.Api.csproj", "Food4Groups.Api/"]
COPY ["Food4Groups.Application/Food4Groups.Application.csproj", "Food4Groups.Application/"]
COPY ["Food4Groups.Domain/Food4Groups.Domain.csproj", "Food4Groups.Domain/"]
COPY ["Food4Groups.Infrastructure/Food4Groups.Infrastructure.csproj", "Food4Groups.Infrastructure/"]
RUN dotnet restore "Food4Groups.Api/Food4Groups.Api.csproj"

COPY . .
WORKDIR "/src/Food4Groups.Api"
RUN dotnet publish "Food4Groups.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Food4Groups.Api.dll"]
