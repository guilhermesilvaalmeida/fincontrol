package com.fincontrol.categories;

import com.fincontrol.users.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DefaultCategorySeeder {

    private final CategoryRepository categoryRepository;

    public DefaultCategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    private record Template(String group, String name, String icon, String color) {}

    private static final List<Template> TEMPLATES = List.of(
            new Template("Alimentação", "Mercado", "🛒", "#0F9D74"),
            new Template("Alimentação", "Restaurante", "🍽️", "#0F9D74"),
            new Template("Alimentação", "Padaria", "🥖", "#0F9D74"),
            new Template("Alimentação", "Delivery", "🛵", "#0F9D74"),
            new Template("Alimentação", "Lanches", "🍔", "#0F9D74"),

            new Template("Casa", "Aluguel", "🏠", "#12203D"),
            new Template("Casa", "Condomínio", "🏢", "#12203D"),
            new Template("Casa", "Energia", "💡", "#12203D"),
            new Template("Casa", "Água", "🚰", "#12203D"),
            new Template("Casa", "Internet", "📶", "#12203D"),
            new Template("Casa", "Gás", "🔥", "#12203D"),
            new Template("Casa", "Manutenção", "🔧", "#12203D"),

            new Template("Transporte", "Combustível", "⛽", "#D9A441"),
            new Template("Transporte", "Uber", "🚗", "#D9A441"),
            new Template("Transporte", "Transporte público", "🚌", "#D9A441"),
            new Template("Transporte", "Estacionamento", "🅿️", "#D9A441"),
            new Template("Transporte", "Manutenção", "🛠️", "#D9A441"),

            new Template("Lazer", "Cinema", "🎬", "#7C6BD9"),
            new Template("Lazer", "Jogos", "🎮", "#7C6BD9"),
            new Template("Lazer", "Viagens", "✈️", "#7C6BD9"),
            new Template("Lazer", "Streaming", "📺", "#7C6BD9"),
            new Template("Lazer", "Eventos", "🎟️", "#7C6BD9"),

            new Template("Saúde", "Farmácia", "💊", "#D64545"),
            new Template("Saúde", "Médico", "🩺", "#D64545"),
            new Template("Saúde", "Exames", "🧪", "#D64545"),
            new Template("Saúde", "Plano de saúde", "❤️", "#D64545"),

            new Template("Educação", "Faculdade", "🎓", "#2F80ED"),
            new Template("Educação", "Cursos", "📚", "#2F80ED"),
            new Template("Educação", "Livros", "📖", "#2F80ED"),
            new Template("Educação", "Material", "✏️", "#2F80ED"),

            new Template("Compras", "Roupas", "👕", "#9B51E0"),
            new Template("Compras", "Eletrônicos", "🔌", "#9B51E0"),
            new Template("Compras", "Casa", "🛋️", "#9B51E0"),

            new Template("Outros", "Outros", "📦", "#6B7280"),

            new Template("Receitas", "Salário", "💰", "#0F9D74"),
            new Template("Receitas", "Freelance", "💼", "#0F9D74"),
            new Template("Receitas", "Comissão", "📈", "#0F9D74"),
            new Template("Receitas", "Aluguel recebido", "🏘️", "#0F9D74"),
            new Template("Receitas", "Outros", "💵", "#0F9D74")
    );

    public void seedForUser(User user) {
        // Categorias já nascem vinculadas ao usuário (não usamos categorias globais compartilhadas
        // para simplificar o MVP e já permitir edição/remoção livre por cada usuário).
        List<Category> categories = TEMPLATES.stream().map(t -> {
            Category category = new Category();
            category.setUserId(user.getId());
            category.setName(t.name());
            category.setGroupName(t.group());
            category.setIcon(t.icon());
            category.setColor(t.color());
            category.setDefault(true);
            return category;
        }).toList();

        categoryRepository.saveAll(categories);
    }
}
