use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod solanavoteapp {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        _description: String,
        _poll_id: u64,
        _poll_start: u64,
        _poll_end: u64,
    ) -> Result<()> {
        ctx.accounts.poll.poll_id = _poll_id;
        ctx.accounts.poll.description = _description;
        ctx.accounts.poll.poll_start = _poll_start;
        ctx.accounts.poll.poll_end = _poll_end;
        ctx.accounts.poll.candidate_count = 0;
        ctx.accounts.poll.bump = ctx.bumps.poll;

        msg!("Poll initialized with ID: {}", ctx.accounts.poll.poll_id);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(300)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_count: u64,
    pub bump: u8,
}
