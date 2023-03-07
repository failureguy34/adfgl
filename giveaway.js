const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Sistema de sorteos")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subCommand) =>
    subCommand.setName("start").setDescription("🎉Empezando sorteo")
  )  
    .addStringOption((option) =>
      option
        .setName("lenght")
        .setDescription("Elije la duracion del sorteo")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("Elije un regalo para el ganador")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("winners")
        .setDescription("Elije la cantidad de ganadores")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("Especifica el canal donde quieres que sea el sorteo")
        .setRequired(true)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pause")
        .setDescription("⏸️ | Pausar sorteo")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Escribe la id del mensaje del sorteo")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unpause")
        .setDescription("⏯️ | Seguir sorteo ")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Escribe la id del mensaje del sorteo")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("⏹️ | Terminar sorteo")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Escribe la id del mensaje del sorteo")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
    subcommand
      .setName("reroll")
      .setDescription("⏯️ | Elegir nuevo ganador")
      .addStringOption((option) =>
        option
          .setName("message-id")
          .setDescription("Escribe la id del mensaje del sorteo")
          .setRequired(true)
      )
  )
  
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("🚮")
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription("Escribe la id del mensaje del sorteo")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const { options } = interaction;

    const sub = options.getSubCommand();

    const errorEmbed = new EmbedBuilder().setColor("Red");
    const success = new EmbedBuilder().setColor("Green");

    if (sub === "start") {
      const gchannel = options.getChannel("channel") || channel;
      const duration = options.getString("lenght");
      const winnerCount = options.getInteger("winners") || 1;
      const prize = options.getString("prize");

      if (isNaN(ms(duration))) {
        errorEmbed.setDescription(
          "Escribe una cantidad de duracion correcta"`1d, 1h, 1m, 1s!`
        );
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
      return client.giveawayManager
        .start(gchannel, {
          duration: duration,
          winnerCount,
          prize,
          message: client.giveawayConfig.messages,
        })
        .then(async () => {
          if (client.giveawayConfig.giveawayManager.everyoneMention) {
            const msg = await gchannel.send("@everyone");
            msg.delete();
          }
          successEmbed.setDescription(`El sorteo empezará en ${gchannel}`);
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        })
        .catch((err) => {
          console.log(err);
          errorEmbed.setDescription(`Error \n\`${err}\``);
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }

    const messageid = options.getString("message-id");
    const giveaway = client.giveawaysManager.find(
      (g) => g.guildId === guildId && g.messageId === messageid
    );
    if (!giveaway) {
      errorEmbed.setDescription(
        `Giveaway con ID ${messageid} no se encontro en la Base de datos!`
      );
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    if (sub === "pause") {
      if (giveaway.isPaused) {
        errorEmbed.setDescription("Este sorteo ya esta pausado!");
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
      await client.giveawaysManager
        .pause(messageId, {
          content: client.giveawayConfig.messages.paused,
          infiniteDurationText:
            client.giveawayConfig.messages.infiniteDurationText,
        })
        .then(() => {
          successEmbed
            .setDescription("⏸️| El sorteo ha sido pausado correctamente")
            .setColor("Blue");
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        })
        .catch((err) => {
          console.log(err);
          errorEmbed.setDescription(`Error \n\ ${err}`);
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }
    if (sub === "unpause") {
      client.giveawayManager
        .unpause(messageId)
        .then(() => {
          successEmbed
            .setDescription("▶️| El sorteo ha sido despausado correctamente")
            .setColor("Blue");
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        })
        .catch((err) => {
          console.log(err);
          errorEmbed.setDescription(`Error \n\ ${err}`);
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }
    if (sub === "end") {
      client.giveawayManager
        .unpause(messageId)
        .then(() => {
          successEmbed
            .setDescription("⏹️| El sorteo ha sido terminado correctamente!")
            .setColor("Blue");
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        })
        .catch((err) => {
          console.log(err);
          errorEmbed.setDescription(`Error \n\ ${err}`);
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }
    if (sub === "reroll") {
      await client.giveawaysManager
        .reroll(messageId, {
          messages: {
            congrat: client.giveawayConfig.messages.congrat,
            error: client.giveawayConfig.messages.error,
          },
        })
        .then(() => {
          successEmbed
            .setDescription("🔁| Hay un nuevo ganador!")
            .setColor("Gold");
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        });
    }
    if (sub === "delete") {
      await client.giveawayManager
        .delete(messageId)
        .then(() => {
          successEmbed
            .setDescription("⏹️| El sorteo ha sido borrado correctamente!")
            .setColor("Blue");
          return interaction.reply({ embeds: [successEmbed], ephemeral: true });
        })
        .catch((err) => {
          console.log(err);
          errorEmbed.setDescription(`Error \n\ ${err}`);
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }
  },
};
