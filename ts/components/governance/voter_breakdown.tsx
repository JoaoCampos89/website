import React from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import { State } from 'ts/redux/reducer';
import { utils } from 'ts/utils/utils';

import { generateUniqueId, Jazzicon } from 'ts/components/ui/jazzicon';
import { Heading, Paragraph } from 'ts/components/text';

import { useAPIClient } from 'ts/hooks/use_api_client';

import { PoolWithStats } from 'ts/types';
import { StakingPoolActivity } from 'ts/pages/staking/history';

interface VoterBreakdownData {
    voter: string;
    proposalId: string;
    support: boolean;
    votingPower: string;
    voterName?: string;
}

const VoteRow = styled.tr`
    border-bottom: 1px solid #d9d9d9;
`;

const VoteTable = styled.table`
    width: 100%;
    margin-bottom: 0.5rem;
`;

const VoteTableHeaderElement = styled.th`
    text-align: left;
`;

const VoteTableHeaderElementSupport = styled.th`
    text-align: center;
`;

const VoteTableHeaderElementPower = styled.th`
    text-align: right;
`;
const VoteRowAddress = styled.td`
    padding: 0.5rem 0;
    display: flex;
`;

interface VoterRowSupportProps {
    supportColor: string;
}

const VoteRowSupport = styled.td<VoterRowSupportProps>`
    text-align: center;
    vertical-align: middle;
    font-family: Formular;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    color: ${(props) => props.supportColor};
`;

const VoteRowPower = styled.td`
    font-family: Formular;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    color: #000000;
    text-align: right;
    vertical-align: middle;
`;

const VoterAddress = styled.span`
    font-family: Formular;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    color: #000000;
    line-height: 30px;
    margin-left: 0.5rem;
`;

const VoterBreakdownWrapper = styled.div`
    margin-bottom: 1rem;
`;

export const VoterBreakdown: React.FC<{ data: VoterBreakdownData[]; showAll?: boolean }> = ({ data, showAll }) => {
    const [stakingPools, setStakingPools] = React.useState<PoolWithStats[] | undefined>(undefined);
    const networkId = useSelector((state: State) => state.networkId);
    const apiClient = useAPIClient(networkId);
    const [isFetchingData, setIsFetchingData] = React.useState(false);

    React.useEffect(() => {
        const fetchAndSetPoolsAsync = async () => {
            const poolsResponse = await apiClient.getStakingPoolsAsync();
            setStakingPools(poolsResponse.stakingPools || []);
            setIsFetchingData(false);
        };
        setIsFetchingData(true);
        // tslint:disable-next-line:no-floating-promises
        fetchAndSetPoolsAsync();
    }, [apiClient]);

    if (data) {
        if (!showAll) {
            data = data.slice(0, 5);
        }
        if (stakingPools) {
            data = data.map((vote) => {
                const foundPool = stakingPools.find((pool) => {
                    return vote.voter.toLowerCase() === pool.operatorAddress.toLowerCase();
                });
                if (foundPool) {
                    vote.voterName = foundPool.metaData.name || `Pool ${foundPool.poolId}`;
                }
                return vote;
            });
        }
    }
    return (
        <VoterBreakdownWrapper>
            {data && data.length > 0 && (
                <>
                    <Heading marginBottom="15px">Votes:</Heading>

                    <VoteTable>
                        <thead>
                            <tr>
                                <VoteTableHeaderElement>Address</VoteTableHeaderElement>
                                <VoteTableHeaderElementSupport>voting for</VoteTableHeaderElementSupport>
                                <VoteTableHeaderElementPower>voting power</VoteTableHeaderElementPower>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((voteData: VoterBreakdownData) => {
                                return (
                                    <VoteRow>
                                        <VoteRowAddress>
                                            <Jazzicon
                                                isSquare={true}
                                                diameter={28}
                                                seed={generateUniqueId(voteData.voter)}
                                            />
                                            <VoterAddress>
                                                {voteData.voterName ||
                                                    utils.getAddressBeginAndEnd(voteData.voter, 4, 4)}
                                            </VoterAddress>
                                        </VoteRowAddress>
                                        <VoteRowSupport supportColor={voteData.support ? 'green' : 'red'}>
                                            {voteData.support ? 'Yes' : 'No'}
                                        </VoteRowSupport>
                                        <VoteRowPower>{voteData.votingPower}</VoteRowPower>
                                    </VoteRow>
                                );
                            })}
                        </tbody>
                    </VoteTable>
                    {/* <Paragraph>
                        <a>View All</a>
                    </Paragraph> */}
                </>
            )}
        </VoterBreakdownWrapper>
    );
};
