use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod solanavoteapp {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        description: String,
        poll_id: u64,
        poll_start: u64,
        poll_end: u64,
    ) -> Result<()> {
        ctx.accounts.poll.poll_id = poll_id;
        ctx.accounts.poll.description = description;
        ctx.accounts.poll.poll_start = poll_start;
        ctx.accounts.poll.poll_end = poll_end;
        ctx.accounts.poll.candidate_count = 0;
        ctx.accounts.poll.bump = ctx.bumps.poll;

        msg!("Poll initialized with ID: {}", ctx.accounts.poll.poll_id);

        Ok(())
    }

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        candidate_name: String,
        _poll_id: u64,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let candidate = &mut ctx.accounts.candidate;

        candidate.name = candidate_name;
        candidate.vote_count = 0;
        candidate.bump = ctx.bumps.candidate;
        poll.candidate_count += 1;

        msg!(
            "Candidate '{}' initialized for Poll ID: {}",
            candidate.name,
            poll.poll_id
        );

        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, _candidate_name: String, _poll_id: u64) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;

        candidate.vote_count += 1;

        msg!(
            "Vote cast for candidate '{}'. Total votes: {}",
            candidate.name,
            candidate.vote_count
        );

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

#[derive(Accounts)]
#[instruction(candidate_name: String, _poll_id: u64)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [_poll_id.to_le_bytes().as_ref()],
        bump = poll.bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [_poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_candidate_name: String, _poll_id: u64)]
pub struct CastVote<'info> {
    pub voter: Signer<'info>,

    #[account(
        seeds = [_poll_id.to_le_bytes().as_ref()],
        bump = poll.bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [_poll_id.to_le_bytes().as_ref(), _candidate_name.as_ref()],
        bump = candidate.bump
    )]
    pub candidate: Account<'info, Candidate>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(100)]
    pub name: String,
    pub vote_count: u64,
    pub bump: u8,
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
